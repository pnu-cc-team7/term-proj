package com.team7.termproject.vote.controller;

import com.team7.termproject.auth.JwtTokenProvider;
import com.team7.termproject.vote.dto.VoteCreateRequest;
import com.team7.termproject.vote.dto.VoteParticipateRequest;
import com.team7.termproject.vote.dto.VoteResponse;
import com.team7.termproject.vote.dto.VoteResultResponse;
import com.team7.termproject.vote.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/votes")
@Slf4j
public class VoteController {

    private final VoteService voteService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<Void> createVote(
            @Valid @RequestBody VoteCreateRequest request
    ) {
        log.info("Creating vote: {}", request.title());
        voteService.createVote(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .build();
    }

    @PostMapping("/{id}/participate")
    public ResponseEntity<Void> participate(
            @PathVariable Long id,
            @Valid @RequestBody VoteParticipateRequest request,
            @CookieValue(name = "token") String token
    ) {
        log.info("Participating in vote {}: {}", id, request.optionId());
        String userKakaoId = jwtTokenProvider.getKakaoId(token);;

        voteService.participate(id, request, userKakaoId);

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<VoteResponse>> getVotes() {
        log.info("Fetching votes");
        return ResponseEntity.ok(voteService.getVotes());
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<VoteResultResponse> getResult(@PathVariable Long id) {
        log.info("Fetching results for vote {}", id);
        return ResponseEntity.ok(voteService.getResult(id));
    }

}
