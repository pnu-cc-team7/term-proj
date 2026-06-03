package com.team7.termproject.vote.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.team7.termproject.vote.entity.VoteOption;
import lombok.Getter;

@Getter
public class VoteOptionResponse {

    private String id;
    private String name;

    @JsonProperty("kakao_id")
    private String kakaoId;

    private Double lat;
    private Double lng;

    public VoteOptionResponse(VoteOption option) {
        this.id = String.valueOf(option.getId());
        this.name = option.getName();
        this.kakaoId = option.getKakaoId();
        this.lat = option.getLat();
        this.lng = option.getLng();
    }
}
