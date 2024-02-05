"use client";
import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { Session } from "next-auth";
import { Button } from "@radix-ui/themes";

const routes = [
  {
    name: "Home",
    href: "/",
  },
  {
    allowedUserRoles: [Role.USER],
    name: "Dashboard",
    href: "/app/",
    children: [],
  },
  {
    type: "NOT_AUTHENTICATED",
    name: "Sign in",
    href: "/api/auth/signin",
  },
  {
    type: "AUTHENTICATED",
    name: "Sign out",
    href: "/api/auth/signout",
  },
];

const isAuthenticated = (
  sessionStatus: "authenticated" | "unauthenticated" | "loading"
) => {
  if (sessionStatus === "authenticated") return true;
  if (sessionStatus === "unauthenticated") return false;
  if (sessionStatus === "loading") return false;
};

const Navbar = () => {
  const session = useSession();

  const hasUserRole = (userRoles: Role[] = []) => {
    console.log(userRoles, session.data?.user?.role);
    return userRoles.includes(session.data?.user?.role);
  };

  return (
    <NavigationMenu.Root className="relative z-[1] flex w-screen justify-center">
      <NavigationMenu.List>
        {routes.map(({ href, name, allowedUserRoles, type }) =>
          (type === "NOT_AUTHENTICATED" && !isAuthenticated(session.status)) ||
          (type === "AUTHENTICATED" && isAuthenticated(session.status)) ? (
            <NavigationMenu.Item key={name}>
              <NavigationMenu.Link href={href}>
                <Button>{name}</Button>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          ) : null
        )}

        <NavigationMenu.Indicator className="data-[state=visible]:animate-fadeIn data-[state=hidden]:animate-fadeOut top-full z-[1] flex h-[10px] items-end justify-center overflow-hidden transition-[width,transform_250ms_ease]">
          <div className="relative top-[70%] h-[10px] w-[10px] rotate-[45deg] rounded-tl-[2px] bg-white" />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className="perspective-[2000px] absolute top-full left-0 flex w-full justify-center">
        <NavigationMenu.Viewport className="data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut relative mt-[10px] h-[var(--radix-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden rounded-[6px] bg-white transition-[width,_height] duration-300 sm:w-[var(--radix-navigation-menu-viewport-width)]" />
      </div>
    </NavigationMenu.Root>
  );
};

export default Navbar;
