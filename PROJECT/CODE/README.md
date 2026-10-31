# Linux File Descriptor and File I/O Management System

A menu-driven C project for demonstrating Linux file descriptors, file I/O, descriptor duplication, `fcntl()`, stdout redirection, process creation, anonymous-pipe IPC, resource limits, and descriptor cleanup.

## Requirements
- Linux or WSL Ubuntu
- GCC
- GNU Make

Install build tools on Ubuntu:
```bash
sudo apt update
sudo apt install build-essential
```

## Build and run
Open a terminal in this project directory:
```bash
make clean
make
./fdmanager
```
Or use:
```bash
make run
```

## Menu demonstrations
| Option | Demonstration | Main system calls / APIs |
|---|---|---|
| 1 | Create/open `sample.txt`, write, seek, read, close | `open`, `write`, `lseek`, `read`, `close` |
| 2 | Display active descriptors through `/proc` | `opendir`, `readdir`, `readlink` |
| 3 | Duplicate a file descriptor | `open`, `dup`, `write`, `close` |
| 4 | Inspect access flags | `open`, `fcntl(F_GETFL)`, `close` |
| 5 | Parent-child message transfer | `pipe`, `fork`, `read`, `write`, `waitpid` |
| 6 | Display current open descriptor count and limits | `getrlimit`, `/proc/self/fd` |
| 7 | Open temporary descriptors and verify cleanup | `open`, `close` |
| 8 | Redirect standard output to `output.txt` and restore it | `dup`, `dup2`, `open`, `close` |

## Recommended demo order
1. Run option 1 to create and populate `sample.txt`.
2. Run option 2 and identify standard descriptors: 0 (stdin), 1 (stdout), 2 (stderr).
3. Run option 3 to see the original and duplicated descriptor numbers.
4. Run option 4 to inspect read/write access mode.
5. Run option 8, then inspect the contents of `output.txt`:
   ```bash
   cat output.txt
   ```
6. Run option 5 to demonstrate parent-child IPC.
7. Run options 6 and 7 to show resource limits and descriptor cleanup.
8. Exit using option 0.

## Important concepts
- A file descriptor (FD) is a small non-negative integer used by a process to refer to an open file or I/O resource.
- Standard descriptors are normally 0 (standard input), 1 (standard output), and 2 (standard error).
- `dup()` creates another descriptor referring to the same open file description.
- `dup2(oldfd, newfd)` makes `newfd` refer to the same open file description as `oldfd`, replacing the previous `newfd` if needed.
- An anonymous pipe is a byte stream. In this demonstration, the parent writes and the child reads.
- The FD leak test compares the descriptor count before and after opening and closing temporary descriptors. It is a demonstration test, not a general-purpose leak detector.

## Project structure
```text
Linux_File_Descriptor_Management_System/
├── include/       # Header files
├── src/           # C implementation files
├── docs/          # Supporting notes
├── sample.txt     # Example file used by demonstrations
├── Makefile
├── run.sh
└── README.md
```

## Troubleshooting
- If `make` is missing: `sudo apt install build-essential`.
- If you see `No such file or directory`, first check your current directory with `pwd` and list files with `ls`.
- Run the executable from the project root so `sample.txt` and `output.txt` are created there.
- If you edit source files, run `make clean && make` before running again.
