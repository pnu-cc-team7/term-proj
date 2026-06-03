package com.team7.termproject.vote.service;

import com.team7.termproject.common.ApiException;
import com.team7.termproject.vote.dto.VoteCreateRequest;
import com.team7.termproject.vote.dto.VoteParticipateRequest;
import com.team7.termproject.vote.entity.Participation;
import com.team7.termproject.vote.entity.Vote;
import com.team7.termproject.vote.entity.VoteOption;
import com.team7.termproject.vote.repository.ParticipationRepository;
import com.team7.termproject.vote.repository.VoteOptionRepository;
import com.team7.termproject.vote.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class VoteService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final ParticipationRepository participationRepository;

    public Long createVote(VoteCreateRequest request) {
        Vote vote = new Vote(request.getTitle());

        for (VoteCreateRequest.OptionRequest optionRequest : request.getOptions()) {
            VoteOption option = new VoteOption(
                    optionRequest.getName(),
                    optionRequest.getKakaoId(),
                    optionRequest.getLat(),
                    optionRequest.getLng(),
                    vote
            );
            vote.getOptions().add(option);
        }

        Vote savedVote = voteRepository.save(vote);
        return savedVote.getId();
    }

    public void participate(Long voteId, VoteParticipateRequest request, String userKakaoId) {

        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "VOTE_NOT_FOUND",
                        "Vote not found"
                ));

        VoteOption option = voteOptionRepository.findById(request.getOptionId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "OPTION_NOT_FOUND",
                        "Option not found"
                ));

        if (!option.getVote().getId().equals(vote.getId())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "OPTION_NOT_IN_VOTE",
                    "Option does not belong to vote"
            );
        }

        if (participationRepository.existsByVoteIdAndUserKakaoId(voteId, userKakaoId)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "ALREADY_PARTICIPATED",
                    "User already participated in this vote"
            );
        }

        Participation participation = new Participation(userKakaoId, vote, option);
        participationRepository.save(participation);
    }
}
