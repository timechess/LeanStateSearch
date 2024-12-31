{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    poetry2nix.url = "github:nix-community/poetry2nix";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    poetry2nix,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
      inherit (poetry2nix.lib.mkPoetry2Nix {inherit pkgs;}) mkPoetryApplication;
    in {
      formatter = pkgs.alejandra;
      devShells.default = import ./shell.nix {inherit pkgs system;};
      packages = {
        lean-learn-be = mkPoetryApplication {projectDir = ./lean-learn-be;};
      };
    });
}
