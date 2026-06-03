package com.team7.termproject.vote.repository;

import com.team7.termproject.vote.entity.Participation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    boolean existsByVoteIdAndUserKakaoId(Long voteId, String userKakaoId);

    long countByOptionId(Long optionId);
}
