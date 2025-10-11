package com.openrun.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DeleteAccountRequest {

    @JsonProperty("user_id")
    private String user_id;

    @JsonProperty("password")
    private String password;

    public String getUser_id() { return user_id; }
    public void setUser_id(String user_id) { this.user_id = user_id; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
