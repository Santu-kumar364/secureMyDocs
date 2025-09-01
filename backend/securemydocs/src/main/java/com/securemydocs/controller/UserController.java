package com.securemydocs.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import com.securemydocs.model.User;
import com.securemydocs.service.UserService;

@RestController
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping("/api/users/profile")
    public User getUserFromToken(@RequestHeader("Authorization") String jwt) {
        return userService.findUserByJwt(jwt)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PutMapping("/api/users")
    public User updateUser(@RequestHeader("Authorization") String jwt, @RequestBody User user) throws Exception {

        Optional<User> reqUser = userService.findUserByJwt(jwt);
        User updatedUser = userService.updateUser(user, reqUser.get().getId());
        return updatedUser;
    }

    

}
