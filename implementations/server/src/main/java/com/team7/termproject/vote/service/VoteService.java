package com.team7.termproject.vote.service;

import com.team7.termproject.common.ApiException;
import com.team7.termproject.vote.dto.VoteCreateRequest;
import com.team7.termproject.vote.dto.VoteParticipateRequest;
import com.team7.termproject.vote.dto.VoteResponse;
import com.team7.termproject.vote.dto.VoteResultResponse;
import com.team7.termproject.vote.dto.VoteResultOptionResponse;
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

import java.util.List;

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

        // 1. 기존 참여 내역 일괄 삭제 (데이터 무결성 유지)
        participationRepository.deleteByVoteIdAndUserKakaoId(vote.getId(), userKakaoId);
        participationRepository.flush();

        // 2. 새로운 선택지들 저장 (다중 선택 대응)
        if (request.getOptionIds() != null && !request.getOptionIds().isEmpty()) {
            for (String idStr : request.getOptionIds()) {
                Long optionId = Long.parseLong(idStr);
                VoteOption option = voteOptionRepository.findById(optionId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "OPTION_NOT_FOUND",
                                "Option " + optionId + " not found"
                        ));

                if (!option.getVote().getId().equals(vote.getId())) {
                    throw new ApiException(
                            HttpStatus.BAD_REQUEST,
                            "OPTION_NOT_IN_VOTE",
                            "Option " + optionId + " does not belong to vote"
                    );
                }

                Participation participation = new Participation(userKakaoId, vote, option);
                participationRepository.save(participation);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<VoteResponse> getVotes() {
        return voteRepository.findAll()
                .stream()
                .map(VoteResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public VoteResultResponse getResult(Long voteId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "VOTE_NOT_FOUND",
                        "Vote not found"
                ));

        List<VoteResultOptionResponse> options = vote.getOptions()
                .stream()
                .map(option -> new VoteResultOptionResponse(
                        option.getId(),
                        option.getName(),
                        participationRepository.countByOptionId(option.getId())
                ))
                .toList();

        long totalVotes = options.stream()
                .mapToLong(VoteResultOptionResponse::getCount)
                .sum();

        return new VoteResultResponse(totalVotes, options);
    }
}
