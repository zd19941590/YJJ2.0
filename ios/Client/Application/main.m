/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>
#import "AppDelegate.h"
#import <dlfcn.h>
#import <sys/types.h>

/**
 程序安全性方案，防止GDB依赖
 */

typedef int (*ptrace_ptr_t)(int _request, pid_t _pid, caddr_t _addr, int _data);
#if !defined(PT_DENY_ATTACH)
		#define PT_DENY_ATTACH 31
#endif  // !defined(PT_DENY_ATTACH)

void disable_gdb() {
  	void* handle = dlopen(0, RTLD_GLOBAL | RTLD_NOW);
  	ptrace_ptr_t ptrace_ptr = dlsym(handle, "ptrace");
  	ptrace_ptr(PT_DENY_ATTACH, 0, 0, 0);
  	dlclose(handle);
}

int main(int argc, char * argv[]) {
#ifndef DEBUG
    disable_gdb();
#endif 
  	@autoreleasepool {
    	return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  	}
}
