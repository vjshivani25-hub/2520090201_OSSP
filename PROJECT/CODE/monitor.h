#ifndef MONITOR_H
#define MONITOR_H
int count_open_fds(void);
void check_fd_limit(void);
void detect_fd_leaks(void);
#endif
