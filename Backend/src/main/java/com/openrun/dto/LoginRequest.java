package com.openrun.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("user_pw")
    private String userPw;

    public LoginRequest() {}

    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserPw() {
        return userPw;
    }
    public void setUserPw(String userPw) {
        this.userPw = userPw;
    }
}