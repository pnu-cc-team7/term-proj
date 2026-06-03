package com.team7.termproject.vote.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class VoteResultResponse {

    private long totalVotes;
    private List<VoteResultOptionResponse> options;

    public VoteResultResponse(long totalVotes, List<VoteResultOptionResponse> options) {
        this.totalVotes = totalVotes;
        this.options = options;
    }
}
