package com.team7.termproject.vote.controller;

import com.team7.termproject.vote.dto.VoteCreateRequest;
import com.team7.termproject.vote.dto.VoteParticipateRequest;
import com.team7.termproject.vote.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/votes")
public class VoteController {

    private final VoteService voteService;

    @PostMapping
    public ResponseEntity<Void> createVote(
            @Valid @RequestBody VoteCreateRequest request
    ) {
        voteService.createVote(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .build();
    }

    @PostMapping("/{id}/participate")
    public ResponseEntity<Void> participate(
            @PathVariable Long id,
            @Valid @RequestBody VoteParticipateRequest request
    ) {
        String userKakaoId = "test-user"; // TODO: Cookie JWT에서 kakaoId 추출하도록 변경

        voteService.participate(id, request, userKakaoId);

        return ResponseEntity.ok().build();
    }
}
