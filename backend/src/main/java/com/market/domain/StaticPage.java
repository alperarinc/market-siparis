package com.market.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "static_pages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StaticPage extends BaseEntity {

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
