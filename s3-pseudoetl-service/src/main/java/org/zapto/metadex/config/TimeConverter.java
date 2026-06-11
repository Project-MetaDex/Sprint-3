package org.zapto.metadex.config;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

public class TimeConverter extends JsonDeserializer<LocalDate> {
    @Override
    public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException, JacksonException {
        long seconds = p.getValueAsLong();
        return Instant.ofEpochSecond(seconds).atZone(ZoneId.systemDefault()).toLocalDate();
    }
}
