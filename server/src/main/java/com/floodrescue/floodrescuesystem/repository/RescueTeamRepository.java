package com.floodrescue.floodrescuesystem.repository;

import com.floodrescue.floodrescuesystem.entity.RescueTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RescueTeamRepository extends JpaRepository<RescueTeam, Long> {
    
    List<RescueTeam> findByStatus(RescueTeam.TeamStatus status);
    
    List<RescueTeam> findByTeamLeaderId(Long teamLeaderId);
}
