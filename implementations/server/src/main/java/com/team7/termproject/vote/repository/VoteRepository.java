package com.team7.termproject.vote.repository;

import com.team7.termproject.vote.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<Vote, Long>{
}
