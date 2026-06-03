package com.team7.termproject.vote.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "participations",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"vote_id", "user_kakao_id"}
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_kakao_id", nullable = false)
    private String userKakaoId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = false)
    private Vote vote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private VoteOption option;

    public Participation(
            String userKakaoId,
            Vote vote,
            VoteOption option
    ) {
        this.userKakaoId = userKakaoId;
        this.vote = vote;
        this.option = option;
        this.createdAt = LocalDateTime.now();
    }
}
