package com.team7.termproject.auth;

import com.team7.termproject.user.ServiceUser;

public record AuthResult(ServiceUser user, String jwt) {
}

