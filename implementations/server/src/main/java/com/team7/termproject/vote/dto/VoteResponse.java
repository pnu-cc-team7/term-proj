package com.team7.termproject.vote.dto;

import com.team7.termproject.vote.entity.Vote;
import lombok.Getter;

import java.util.List;

@Getter
public class VoteResponse {

    private String id;
    private String title;
    private List<VoteOptionResponse> options;

    public VoteResponse(Vote vote) {
        this.id = String.valueOf(vote.getId());
        this.title = vote.getTitle();
        this.options = vote.getOptions()
                .stream()
                .map(VoteOptionResponse::new)
                .toList();
    }
}
