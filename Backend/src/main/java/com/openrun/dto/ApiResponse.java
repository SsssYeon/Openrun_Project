// src/main/java/com/openrun/dto/ApiResponse.java

package com.openrun.dto;
import lombok.AllArgsConstructor; import lombok.Getter;
@Getter @AllArgsConstructor
public class ApiResponse<T> { private boolean success; private String message; private T data; }