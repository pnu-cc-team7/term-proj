package com.team7.termproject.vote.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class VoteCreateRequest {

    private String title;

    private List<OptionRequest> options;

    @Getter
    @NoArgsConstructor
    public static class OptionRequest {

        private String name;

        @JsonProperty("kakao_id")
        private String kakaoId;

        private Double lat;

        private Double lng;
    }
}
