package com.market.service;

import com.market.exception.BusinessException;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.endpoint:http://localhost:9000}")
    private String endpoint;

    @Value("${minio.bucket:market-images}")
    private String bucket;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    public String upload(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new BusinessException("Dosya boş");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BusinessException("Geçersiz dosya tipi. JPG, PNG veya WebP yükleyin.");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BusinessException("Dosya boyutu 5MB'dan büyük olamaz");
        }

        String extension = getExtension(file.getOriginalFilename());
        String objectName = folder + "/" + UUID.randomUUID() + "." + extension;

        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            String url = endpoint + "/" + bucket + "/" + objectName;
            log.info("Dosya yüklendi: {}", url);
            return url;
        } catch (Exception e) {
            log.error("Dosya yükleme hatası", e);
            throw BusinessException.serviceUnavailable("Dosya yüklenemedi. Lütfen tekrar deneyin.");
        }
    }

    public void delete(String fileUrl) {
        try {
            String objectName = fileUrl.replace(endpoint + "/" + bucket + "/", "");
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket).object(objectName).build());
            log.info("Dosya silindi: {}", objectName);
        } catch (Exception e) {
            log.warn("Dosya silinemedi: {}", e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
