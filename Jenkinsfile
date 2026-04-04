pipeline {
    agent any

    environment {
        DOCKER_REGISTRY   = 'registry.example.com'
        IMAGE_NAME        = 'market-siparis/backend'
        FRONTEND_IMAGE    = 'market-siparis/frontend'
        K8S_NAMESPACE     = 'market-siparis'
        JAVA_HOME         = tool('JDK-25')
        MAVEN_OPTS        = '-Xmx1024m'
        SCANNER_HOME      = tool('SonarQubeScanner')
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = "${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT}-${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Backend - Build & Test') {
            steps {
                dir('backend') {
                    sh '''
                        chmod +x mvnw
                        ./mvnw clean verify \
                            -Dmaven.test.failure.ignore=false \
                            -Dspring.profiles.active=test
                    '''
                }
            }
            post {
                always {
                    dir('backend') {
                        junit testResults: 'target/surefire-reports/**/*.xml', allowEmptyResults: true
                        jacoco execPattern: 'target/jacoco.exec',
                               classPattern: 'target/classes',
                               sourcePattern: 'src/main/java'
                    }
                }
            }
        }

        stage('Backend - Code Quality') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    changeRequest()
                }
            }
            steps {
                dir('backend') {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            ${SCANNER_HOME}/bin/sonar-scanner \
                                -Dsonar.projectKey=market-siparis-backend \
                                -Dsonar.sources=src/main/java \
                                -Dsonar.tests=src/test/java \
                                -Dsonar.java.binaries=target/classes \
                                -Dsonar.java.libraries=target/dependency/*.jar \
                                -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            parallel {
                stage('Backend Image') {
                    steps {
                        dir('backend') {
                            sh """
                                docker build \
                                    -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                                    -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest \
                                    --label 'git.commit=${env.GIT_COMMIT_SHORT}' \
                                    --label 'build.number=${env.BUILD_NUMBER}' \
                                    .
                            """
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        dir('frontend') {
                            sh """
                                docker build \
                                    -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                    -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest \
                                    .
                            """
                        }
                    }
                }
            }
        }

        stage('Docker Push') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'release/*'
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-registry-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo \$DOCKER_PASS | docker login ${DOCKER_REGISTRY} -u \$DOCKER_USER --password-stdin
                        docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest
                        docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-staging-creds', namespace: K8S_NAMESPACE]) {
                    sh """
                        kubectl set image deployment/market-backend \
                            backend=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}
                        kubectl set image deployment/market-frontend \
                            frontend=${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment/market-backend -n ${K8S_NAMESPACE} --timeout=300s
                        kubectl rollout status deployment/market-frontend -n ${K8S_NAMESPACE} --timeout=300s
                    """
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message 'Production ortamına deploy edilsin mi?'
                ok 'Deploy Et'
                submitter 'admin,devops'
            }
            steps {
                withKubeConfig([credentialsId: 'k8s-prod-creds', namespace: K8S_NAMESPACE]) {
                    sh """
                        kubectl set image deployment/market-backend \
                            backend=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}
                        kubectl set image deployment/market-frontend \
                            frontend=${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment/market-backend -n ${K8S_NAMESPACE} --timeout=300s
                        kubectl rollout status deployment/market-frontend -n ${K8S_NAMESPACE} --timeout=300s
                    """
                }
            }
        }

        stage('Smoke Test') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def healthUrl = (env.BRANCH_NAME == 'main')
                        ? 'https://api.koyluoglufresh.com/actuator/health'
                        : 'https://staging-api.koyluoglufresh.com/actuator/health'

                    sh """
                        for i in 1 2 3 4 5; do
                            STATUS=\$(curl -s -o /dev/null -w '%{http_code}' ${healthUrl} || true)
                            if [ "\$STATUS" = "200" ]; then
                                echo "Health check başarılı!"
                                exit 0
                            fi
                            echo "Deneme \$i/5 - bekleniyor..."
                            sleep 10
                        done
                        echo "Health check başarısız!"
                        exit 1
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline başarıyla tamamlandı: ${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline başarısız oldu!"
            // Slack/email notification eklenebilir
        }
        always {
            cleanWs()
        }
    }
}
