package com.gatherr.backend.dto.calendar;

import java.util.List;

public record CalendarListDto(List<CalendarSummaryDto> calendars) {}