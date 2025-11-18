package com.openrun.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SignupRequest {

    @JsonProperty("user_id")
    private String user_id;

    @JsonProperty("user_pw")
    private String user_pw;

    @JsonProperty("user_nm")
    private String user_nm;

    @JsonProperty("user_nicknm")
    private String user_nicknm;

    @JsonProperty("user_phonenum")
    private String user_phonenum;

    public SignupRequest() {}

    public String getUser_id() { return user_id; }
    public void setUser_id(String user_id) { this.user_id = user_id; }

    public String getUser_pw() { return user_pw; }
    public void setUser_pw(String user_pw) { this.user_pw = user_pw; }

    public String getUser_nm() { return user_nm; }
    public void setUser_nm(String user_nm) { this.user_nm = user_nm; }

    public String getUser_nicknm() { return user_nicknm; }
    public void setUser_nicknm(String user_nicknm) { this.user_nicknm = user_nicknm; }

    public String getUser_phonenum() { return user_phonenum; }
    public void setUser_phonenum(String user_phonenum) { this.user_phonenum = user_phonenum; }
}
