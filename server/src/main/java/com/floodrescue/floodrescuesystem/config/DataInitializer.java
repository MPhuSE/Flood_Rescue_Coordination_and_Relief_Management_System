package com.floodrescue.floodrescuesystem.config;

import com.floodrescue.floodrescuesystem.entity.Role;
import com.floodrescue.floodrescuesystem.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {
            createRoleIfMissing(roleRepository, "ADMIN", "System administrator");
            createRoleIfMissing(roleRepository, "RESCUER", "Rescue team member");
            createRoleIfMissing(roleRepository, "CITIZEN", "Citizen using the platform");
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
}
