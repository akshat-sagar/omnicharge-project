package com.oprationPlanManagement.operatorPlanService.configuration;

import com.oprationPlanManagement.operatorPlanService.entity.OperatorEntity;
import com.oprationPlanManagement.operatorPlanService.entity.PlanEntity;
import com.oprationPlanManagement.operatorPlanService.repository.IOperatorRepository;
import com.oprationPlanManagement.operatorPlanService.repository.IPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OperatorPlanSeeder implements CommandLineRunner {

    private static final List<String> OPERATORS = List.of(
            "Jio",
            "Airtel",
            "Vi",
            "BSNL",
            "MTNL",
            "Tata Tele"
    );

    private static final List<PlanSeed> PLANS = List.of(
            new PlanSeed("Jio", 239.0, "28 days", "1.5GB/day, unlimited calls, 100 SMS/day"),
            new PlanSeed("Jio", 479.0, "56 days", "1.5GB/day, unlimited calls, Jio apps access"),
            new PlanSeed("Jio", 749.0, "84 days", "2GB/day, unlimited calls, Jio apps, OTT bundle"),
            new PlanSeed("Airtel", 199.0, "28 days", "1GB/day, unlimited calls, 100 SMS/day"),
            new PlanSeed("Airtel", 699.0, "84 days", "2GB/day, unlimited calls, Apollo 24|7 benefits"),
            new PlanSeed("Airtel", 999.0, "365 days", "1.5GB/day, unlimited calls, yearly unlimited pack"),
            new PlanSeed("Vi", 199.0, "28 days", "1GB/day, unlimited calls, weekend data rollover"),
            new PlanSeed("Vi", 839.0, "84 days", "2GB/day, unlimited calls, binge all night data"),
            new PlanSeed("Vi", 1099.0, "365 days", "1.5GB/day, unlimited calls, long validity annual pack"),
            new PlanSeed("BSNL", 107.0, "35 days", "Unlimited BSNL to BSNL calls, 1.5GB total data"),
            new PlanSeed("BSNL", 485.0, "84 days", "1GB/day, unlimited calls, national roaming"),
            new PlanSeed("BSNL", 999.0, "365 days", "2GB/day, unlimited calls, nationwide yearly pack"),
            new PlanSeed("MTNL", 149.0, "30 days", "Talktime pack with SMS and basic data top-up"),
            new PlanSeed("MTNL", 499.0, "60 days", "Voice + data combo with caller tunes access"),
            new PlanSeed("MTNL", 799.0, "180 days", "Talktime plus data combo with six-month validity"),
            new PlanSeed("Tata Tele", 299.0, "28 days", "1.5GB/day, unlimited calls, free incoming roaming"),
            new PlanSeed("Tata Tele", 899.0, "90 days", "2GB/day, unlimited calls, premium support"),
            new PlanSeed("Tata Tele", 1299.0, "365 days", "Annual unlimited pack with premium support")
    );

    private final IOperatorRepository operatorRepository;
    private final IPlanRepository planRepository;

    @Override
    @Transactional
    public void run(String... args) {
        Map<String, OperatorEntity> existingOperators = operatorRepository.findAll().stream()
                .collect(Collectors.toMap(
                        operator -> normalize(operator.getName()),
                        Function.identity(),
                        (left, right) -> left
                ));

        for (String operatorName : OPERATORS) {
            String key = normalize(operatorName);
            if (!existingOperators.containsKey(key)) {
                OperatorEntity operator = new OperatorEntity();
                operator.setName(operatorName);
                existingOperators.put(key, operatorRepository.save(operator));
            }
        }

        Map<String, Long> operatorIdsByName = existingOperators.values().stream()
                .collect(Collectors.toMap(
                        operator -> normalize(operator.getName()),
                        OperatorEntity::getId,
                        (left, right) -> left
                ));

        List<PlanEntity> existingPlans = planRepository.findAll();

        for (PlanSeed planSeed : PLANS) {
            Long operatorId = operatorIdsByName.get(normalize(planSeed.operatorName()));
            if (operatorId == null) {
                continue;
            }

            boolean exists = existingPlans.stream().anyMatch(plan ->
                    operatorId.equals(plan.getOperatorId())
                            && Double.compare(plan.getAmount() == null ? 0.0 : plan.getAmount(), planSeed.amount()) == 0
                            && normalize(planSeed.validity()).equals(normalize(plan.getValidity()))
                            && normalize(planSeed.description()).equals(normalize(plan.getDescription()))
            );

            if (!exists) {
                PlanEntity plan = new PlanEntity();
                plan.setAmount(planSeed.amount());
                plan.setValidity(planSeed.validity());
                plan.setDescription(planSeed.description());
                plan.setOperatorId(operatorId);
                existingPlans.add(planRepository.save(plan));
            }
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private record PlanSeed(String operatorName, Double amount, String validity, String description) {
    }
}
