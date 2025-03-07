'use client';
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle
} from "@heroui/navbar";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import NextLink from "next/link";


import {
  GithubIcon,
  HeartFilledIcon,
  Logo
} from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";
import { Avatar } from "@heroui/avatar";
import { LogOutIcon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

export const Navbar = () => {

  const { data: session } = useSession();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="border-b border-default-200">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
          </NextLink>
        </NavbarBrand>
        {session ? <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul> : null}
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          {/* <Link isExternal aria-label="Twitter" href={siteConfig.links.twitter}>
            <TwitterIcon className="text-default-500" />
          </Link> */}
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={''}
            startContent={<HeartFilledIcon className="text-danger" />}
            variant="flat"
          >
            Sponsor
          </Button>
        </NavbarItem>
        {session ? (
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                size="sm"
                src={session.user?.image || "https://i.pravatar.cc/150?u=a04258114e29026702d"}
              />

            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="text-sm font-bold">{session.user?.name}</div>
                <div className="text-xs text-default-500">{session.user?.email}</div>
                <Button
                  className="mt-2 w-full"
                  color="danger"
                  variant="flat"
                  onPress={() => signOut()}
                >
                  <LogOutIcon size={16} /> Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button color="primary" variant="flat" onPress={() => signIn()}>
            Login
          </Button>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {session ? <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}

        </div> : null}

        {session ? (
          <Button
            className="mt-2 w-full"
            color="danger"
            variant="flat"
            onPress={() => signOut()}
          >
            <LogOutIcon size={16} /> Logout
          </Button>
        ) : (
          <Button color="primary" variant="flat" onPress={() => signIn()}>
            Login
          </Button>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
};