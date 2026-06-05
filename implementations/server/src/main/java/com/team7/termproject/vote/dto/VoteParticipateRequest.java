package com.team7.termproject.vote.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class VoteParticipateRequest {
    private List<String> optionIds;
}
