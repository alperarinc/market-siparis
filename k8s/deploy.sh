#!/bin/bash
set -euo pipefail

echo "============================================"
echo " Market Siparis - Kubernetes Deployment"
echo "============================================"

# 1. cert-manager kurulumu (zaten yoksa)
echo ""
echo "[1/6] cert-manager kontrol ediliyor..."
if ! kubectl get namespace cert-manager &>/dev/null; then
  echo "  -> cert-manager kuruluyor..."
  kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.2/cert-manager.yaml
  echo "  -> cert-manager pod'larinin hazir olmasini bekleniyor..."
  kubectl wait --for=condition=Available deployment --all -n cert-manager --timeout=120s
else
  echo "  -> cert-manager zaten kurulu."
fi

# 2. Namespace olustur
echo ""
echo "[2/6] Namespace olusturuluyor..."
kubectl apply -f base/namespace.yml

# 3. GHCR Secret olustur (interaktif)
echo ""
echo "[3/6] GHCR image pull secret..."
if ! kubectl get secret ghcr-login-secret -n market-siparis &>/dev/null; then
  echo "  GitHub Personal Access Token (read:packages) gerekli."
  echo "  Asagidaki komutu calistirin:"
  echo ""
  echo "  kubectl create secret docker-registry ghcr-login-secret \\"
  echo "    --namespace=market-siparis \\"
  echo "    --docker-server=ghcr.io \\"
  echo "    --docker-username=alperarinc \\"
  echo "    --docker-password=<GITHUB_PAT>"
  echo ""
  read -p "  Secret olusturduktan sonra devam etmek icin Enter'a basin..."
else
  echo "  -> ghcr-login-secret zaten mevcut."
fi

# 4. Cloudflare API token secret + ClusterIssuer
echo ""
echo "[4/6] Cert-manager Cloudflare yapilandiriliyor..."
echo "  UYARI: cert-manager/cloudflare-api-secret.yml icindeki token'i guncellemeyi unutmayin!"
kubectl apply -f cert-manager/cloudflare-api-secret.yml
kubectl apply -f cert-manager/cluster-issuer.yml

# 5. Tum base kaynaklarini uygula
echo ""
echo "[5/6] Kubernetes kaynaklari uygulaniyor..."
kubectl apply -f base/secret.yml
kubectl apply -f base/configmap.yml
kubectl apply -f base/postgres-deployment.yml
kubectl apply -f base/minio-pvc.yml
kubectl apply -f base/minio-deployment.yml
kubectl apply -f base/minio-service.yml
kubectl apply -f base/backend-deployment.yml
kubectl apply -f base/backend-service.yml
kubectl apply -f base/backend-hpa.yml
kubectl apply -f base/frontend-deployment.yml
kubectl apply -f base/frontend-service.yml
kubectl apply -f base/frontend-hpa.yml

# 6. Ingress + Certificate
echo ""
echo "[6/6] Ingress ve TLS sertifikasi uygulaniyor..."
kubectl apply -f cert-manager/certificate.yml
kubectl apply -f base/ingress.yml

echo ""
echo "============================================"
echo " Deployment tamamlandi!"
echo "============================================"
echo ""
echo " Frontend: https://koyluoglu.com"
echo " Backend:  https://api.koyluoglu.com"
echo ""
echo " Durumu kontrol et:"
echo "   kubectl get pods -n market-siparis"
echo "   kubectl get certificate -n market-siparis"
echo "   kubectl get ingress -n market-siparis"
echo ""
echo " Cloudflare DNS kayitlari:"
echo "   koyluoglu.com      -> A/CNAME -> <INGRESS_EXTERNAL_IP>"
echo "   api.koyluoglu.com  -> A/CNAME -> <INGRESS_EXTERNAL_IP>"
echo "   Proxy: OFF (DNS only) - cert-manager DNS01 icin gerekli"
echo ""
