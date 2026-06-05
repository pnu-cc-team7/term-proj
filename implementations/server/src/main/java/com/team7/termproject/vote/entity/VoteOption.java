package com.team7.termproject.vote.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "options")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VoteOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @org.hibernate.annotations.Nationalized
    private String name;

    @Column(name = "kakao_id", nullable = false)
    private String kakaoId;

    private Double lat;

    private Double lng;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = false)
    private Vote vote;

    public VoteOption(
            String name,
            String kakaoId,
            Double lat,
            Double lng,
            Vote vote
    ) {
        this.name = name;
        this.kakaoId = kakaoId;
        this.lat = lat;
        this.lng = lng;
        this.vote = vote;
    }
}
