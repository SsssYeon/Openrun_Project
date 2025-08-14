package com.openrun.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChangePasswordRequest {

    @JsonProperty("user_id")
    private String user_id;

    @JsonProperty("currentPassword")
    private String currentPassword;

    @JsonProperty("newPassword")
    private String newPassword;

    public ChangePasswordRequest() {}

    public String getUser_id() { return user_id; }
    public void setUser_id(String user_id) { this.user_id = user_id; }

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
