package cn.beita.treehole.common;

import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ApiResponse<Void> business(BusinessException e) { return ApiResponse.fail(e.getCode(), e.getMessage()); }
    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    public ApiResponse<Void> badRequest(Exception e) { return ApiResponse.fail(400, "请求参数不正确"); }
    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> unknown(Exception e) { return ApiResponse.fail(500, "服务器内部错误"); }
}
