package com.gatherr;

import com.gatherr.backend.model.Event;
import com.gatherr.backend.model.EventUser;
import com.gatherr.backend.model.User;
import com.gatherr.backend.model.enums.EventType;
import com.gatherr.backend.repository.EventRepository;
import com.gatherr.backend.repository.EventUserRepository;
import com.gatherr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;


@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private static final String ME_EMAIL = "dev@gatherr.com";
    private static final Random RANDOM = new Random(42);
    private static final LocalTime DAY_START = LocalTime.of(9, 0);
    private static final LocalTime DAY_END   = LocalTime.of(17, 0);

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByEmail(ME_EMAIL).isPresent()) {
            log.info("[DataSeeder] Seed data already present, skipping.");
            return;
        }

        log.info("[DataSeeder] Seeding dev data...");

        List<User> users = seedUsers();
        List<Event> events = seedEvents(users);
        seedEventUsers(events, users.get(0), users.subList(1, users.size()));

        log.info("[DataSeeder] Done. Seeded {} users, {} events.", users.size(), events.size());
    }

    private List<User> seedUsers() {
        return userRepository.saveAll(List.of(
            createUser("Dev User", ME_EMAIL, "Europe/Tallinn", "EN"),
            createUser("Marta Kask", "marta.kask@example.com", "Europe/Tallinn", "ET"),
            createUser("Jürgen Tamm", "jurgen.tamm@example.com", "Europe/Tallinn", "ET"),
            createUser("Sofia Müller", "sofia.muller@example.com", "Europe/Berlin", "EN"),
            createUser("Lena Virtanen", "lena.virtanen@example.com", "Europe/Helsinki", "EN")
        ));
    }

    private User createUser(String name, String email, String tz, String language) {
        return User.builder().name(name).email(email).timezone(tz).language(language).build();
    }

    private List<Event> seedEvents(List<User> users) {
        return eventRepository.saveAll(List.of(
            createEvent("Team Retrospective", "End-of-sprint retro. Pick a slot.", "team-retro", users.get(0), 7, 2, 30, "Europe/Tallinn"),
            createEvent("Design Review", "Walk through the new heatmap UI designs.", "design-review", users.get(1), 2, 1, 30, "Europe/Tallinn"),
            createEvent("Q3 Planning", "Quarterly roadmap planning session.", "q3-plan", users.get(2), 30, 2, 60, "Europe/Tallinn"),
            createEvent("Coffee Chat", "Casual sync — no agenda.", "coffee-sync", users.get(3), 1, 0, 30, "Europe/Berlin"),
            createEvent("Onboarding Session", "Kick-off for the two new team members.", "onboarding-may", users.get(4), 10, 1, 30, "Europe/Helsinki"),
            createEvent("Summer Hackathon", "Two-day build event. Vote for dates.", "hack-summer", users.get(0), 60, 1, 60, "Europe/Tallinn")
        ));
    }

    private Event createEvent(String name, String desc, String shortId, User creator, int daysOffset, int daysDuration, int increment, String tz) {
        LocalDate start = LocalDate.now().plusDays(daysOffset);
        return Event.builder()
                .name(name).description(desc).shortId(shortId).creator(creator)
                .type(EventType.SPECIFIC_DATES).timezone(tz).timeIncrement(increment)
                .times(slots(start, start.plusDays(daysDuration), increment))
                .build();
    }

    private List<String> slots(LocalDate startDate, LocalDate endDate, int incrementMinutes) {
        List<String> result = new ArrayList<>();
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("ddMMyyyy");
        
        for (LocalDate day = startDate; !day.isAfter(endDate); day = day.plusDays(1)) {
            String datePart = day.format(dateFmt);
            for (LocalTime time = DAY_START; time.isBefore(DAY_END); time = time.plusMinutes(incrementMinutes)) {
                result.add(String.format("%02d%02d-%s", time.getHour(), time.getMinute(), datePart));
            }
        }
        return result;
    }

    private void seedEventUsers(List<Event> events, User me, List<User> others) {
        List<EventUser> eventUsers = new ArrayList<>();
        
        for (Event event : events) {
            // Me: joined every event but no availability marked
            eventUsers.add(createEventUser(event, me, Collections.emptyList()));
            
            // Others: 30-70% availability
            others.forEach(other -> eventUsers.add(
                createEventUser(event, other, randomSubset(event.getTimes(), 0.30, 0.70))
            ));
        }
        
        eventUserRepository.saveAll(eventUsers);
    }

    private EventUser createEventUser(Event event, User user, List<String> availableSlots) {
        return EventUser.builder()
                .event(event).user(user).timezone(user.getTimezone())
                .available(availableSlots).notAvailable(Collections.emptyList())
                .build();
    }

    private <T> List<T> randomSubset(List<T> items, double minFraction, double maxFraction) {
        if (items.isEmpty()) return Collections.emptyList();
        
        int count = (int) Math.round(items.size() * (minFraction + RANDOM.nextDouble() * (maxFraction - minFraction)));
        List<T> shuffled = new ArrayList<>(items);
        Collections.shuffle(shuffled, RANDOM);
        
        return shuffled.subList(0, count);
    }
}