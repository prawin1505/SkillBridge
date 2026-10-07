package com.skillbridge.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.skillbridge.dto.MatchResponse;
import com.skillbridge.entity.User;
import com.skillbridge.entity.UserSkill;
import com.skillbridge.repository.UserRepository;
import com.skillbridge.repository.UserSkillRepository;

@Service
public class MatchService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;

    public MatchService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository) {

        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
    }

    public List<MatchResponse> findMatches(User currentUser) {

        List<UserSkill> mySkills =
                userSkillRepository.findByUserId(currentUser.getId());

        List<User> users =
                userRepository.findAll();

        List<MatchResponse> matches = new ArrayList<>();

        Map<Long, String> myTeachSkills = new HashMap<>();
        Map<Long, String> myLearnSkills = new HashMap<>();

        for (UserSkill skill : mySkills) {

            Long skillId = skill.getSkill().getId();
            String skillName = skill.getSkill().getName();

            if ("TEACH".equalsIgnoreCase(
                    skill.getType().toString())) {

                myTeachSkills.put(skillId, skillName);
            }

            if ("LEARN".equalsIgnoreCase(
                    skill.getType().toString())) {

                myLearnSkills.put(skillId, skillName);
            }
        }

        for (User otherUser : users) {

            if (otherUser.getId().equals(currentUser.getId())) {
                continue;
            }

            List<UserSkill> otherSkills =
                    userSkillRepository.findByUserId(
                            otherUser.getId()
                    );

            boolean teachMatch = false;
            boolean learnMatch = false;

            List<String> youCanTeach = new ArrayList<>();
            List<String> youCanLearn = new ArrayList<>();
            List<String> theyCanTeach = new ArrayList<>();
            List<String> theyCanLearn = new ArrayList<>();

            for (UserSkill otherSkill : otherSkills) {

                Long skillId =
                        otherSkill.getSkill().getId();

                String skillName =
                        otherSkill.getSkill().getName();

                String type =
                        otherSkill.getType().toString();

                // Other user can teach something
                // current user wants to learn
                if ("TEACH".equalsIgnoreCase(type)
                        && myLearnSkills.containsKey(skillId)) {

                    learnMatch = true;

                    youCanLearn.add(
                            myLearnSkills.get(skillId)
                    );

                    theyCanTeach.add(skillName);
                }

                // Other user wants to learn something
                // current user can teach
                if ("LEARN".equalsIgnoreCase(type)
                        && myTeachSkills.containsKey(skillId)) {

                    teachMatch = true;

                    youCanTeach.add(
                            myTeachSkills.get(skillId)
                    );

                    theyCanLearn.add(skillName);
                }
            }

            int score = 0;

            if (teachMatch) {
                score += 50;
            }

            if (learnMatch) {
                score += 50;
            }

            if (score > 0) {

                matches.add(
                        new MatchResponse(
                                otherUser.getId(),
                                otherUser.getFirstName(),
                                otherUser.getLastName(),
                                otherUser.getEmail(),
                                score,
                                youCanTeach,
                                youCanLearn,
                                theyCanTeach,
                                theyCanLearn
                        )
                );
            }
        }

        return matches;
    }
}