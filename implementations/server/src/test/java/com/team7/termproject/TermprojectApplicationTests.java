package com.team7.termproject;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.jwt.secret=12345678901234567890123456789012")
class TermprojectApplicationTests {

	@Test
	void contextLoads() {
	}

}


