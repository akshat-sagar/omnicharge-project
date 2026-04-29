package com.omnicharge.rechargeprocessing.support;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class DefaultRequestUserContext implements RequestUserContext {

    @Override
    public String getUserIdHeader() {
        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        return request.getHeader("X-User-Id");
    }
}
