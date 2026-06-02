package com.team7.termproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TermprojectApplication {

	public static void main(String[] args) {
		SpringApplication.run(TermprojectApplication.class, args);
	}

}


