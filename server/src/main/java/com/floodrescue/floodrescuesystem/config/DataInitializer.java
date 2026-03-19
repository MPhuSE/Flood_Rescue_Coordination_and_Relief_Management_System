package com.floodrescue.floodrescuesystem.config;

import com.floodrescue.floodrescuesystem.entity.Role;
import com.floodrescue.floodrescuesystem.entity.User;
import com.floodrescue.floodrescuesystem.repository.RoleRepository;
import com.floodrescue.floodrescuesystem.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedRoles(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createRoleIfMissing(roleRepository, "ADMIN", "System administrator");
            createRoleIfMissing(roleRepository, "RESCUER", "Rescue team member");
            createRoleIfMissing(roleRepository, "CITIZEN", "Citizen using the platform");
            
            // Create default user
            createDefaultUserIfMissing(userRepository, roleRepository, passwordEncoder);
        };
    }

    private void createRoleIfMissing(RoleRepository roleRepository, String name, String description) {
        if (roleRepository.findByName(name).isEmpty()) {
            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            roleRepository.save(role);
        }
    }

    private void createDefaultUserIfMissing(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        if (userRepository.findByUsername("demo").isEmpty()) {
            User user = new User();
            user.setUsername("demo");
            user.setFullName("Demo User");
            user.setEmail("demo@example.com");
            user.setPhone("0123456789");
            user.setAddress("123 Demo Street");
            user.setPasswordHash(passwordEncoder.encode("demo123"));
            user.setStatus("ACTIVE");
            user.setCreatedAt(LocalDateTime.now());
            
            Role citizenRole = roleRepository.findByName("CITIZEN")
                    .orElseThrow(() -> new RuntimeException("CITIZEN role not found"));
            user.setRole(citizenRole);
            
            userRepository.save(user);
        }
    }
}

