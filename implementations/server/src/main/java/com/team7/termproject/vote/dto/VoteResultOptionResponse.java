package com.team7.termproject.vote.dto;

import lombok.Getter;

@Getter
public class VoteResultOptionResponse {

    private String optionId;
    private String name;
    private long count;

    public VoteResultOptionResponse(Long optionId, String name, long count) {
        this.optionId = String.valueOf(optionId);
        this.name = name;
        this.count = count;
    }
}
