{
  devPkgs = {
    pkgs,
    system ? "x86_64-linux",
  }:
    with pkgs; ([
        libiconv
        openssl
        poetry
        bashInteractive
        alejandra
        which
        coreutils
        gnumake
        git
        fd
        ripgrep
        shellcheck
        bubblewrap
        protobuf
        buf

        caddy
      ]
      ++ (with nodePackages_latest; [nodejs_22 pnpm prettier eslint prisma])
      ++ (
        if (system == "aarch64-darwin" || system == "x86_64-darwin")
        then [darwin.apple_sdk.frameworks.SystemConfiguration]
        else []
      ));
}
