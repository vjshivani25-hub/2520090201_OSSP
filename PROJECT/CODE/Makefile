CC = gcc
CFLAGS = -Wall -Wextra -Wpedantic -std=c11 -g
CPPFLAGS = -Iinclude
TARGET = fdmanager
SOURCES = src/main.c src/file_io.c src/fd_table.c src/redirect.c src/ipc.c src/monitor.c
OBJECTS = $(SOURCES:.c=.o)

.PHONY: all clean run
all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) $(OBJECTS) -o $@

src/%.o: src/%.c
	$(CC) $(CPPFLAGS) $(CFLAGS) -c $< -o $@

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET) $(OBJECTS)
