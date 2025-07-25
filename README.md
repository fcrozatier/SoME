# Summer of Math Exposition

The [Summer of Math Exposition](https://some.3b1b.co/) is an annual competition fostering the creation of excellent maths & science content online.

This repo contains the code of the website and algorithm.

## Voting system

At the heart of the competition is the custom voting system we designed to deal with a massive competition where voters have partial knowledge of all the entries.

### Overview

You can find an overview of the algorithm currently in use in the competition on the [algorithm](https://some.3b1b.co/algorithm) section of the website. The post describes the key principles of algorithm the as well as former attempts we made.

### Benchmark

The choice and design of a voting system that meets our criterions was guided by a benchmark comparing the performance of solutions like the Page Rank algorithm and crowd sourcing solutions as found in the Crowd BT family.

The whole benchmark is available in the [fcrozatier/voting-systems-benchmark](https://github.com/fcrozatier/voting-systems-benchmark) repo.

### TL;DR

The most robust & performant algorithm we benchmarked is the [Majority Judgement](https://en.wikipedia.org/wiki/Majority_judgment). It also is very simple to understand as it's based on the [median](https://en.wikipedia.org/wiki/Median).

Our implementation optimizes for quality on top of this basis by filtering entries in different passes as described in the [algorithm](https://some.3b1b.co/algorithm) section. This ensures the best possible outcome and an enjoyable voting process.

## Previous editions

All entries of previous editions are available in the [archive](https://some.3b1b.co/archive)

The SoME3 legacy website with its custom voting system based on [expander graphs](https://en.wikipedia.org/wiki/Expander_graph) is available in the [fcrozatier/champagne](https://github.com/fcrozatier/champagne) repo.

## Sponsors

Operations for this contest have been generously funded by:

<p align="center">
  <a href="https://www.3blue1brown.com/" style="margin: 0 16px;">
    <img src="static/sponsors/3b1b-logo.png" width="85" alt="3b1b">
  </a>
  <a href="https://www.janestreet.com/" style="margin: 0 16px;">
    <img src="static/sponsors/jane-street-logo.png" width="300" alt="Jane Street">
  </a>
  <a href="https://brilliant.org/" style="margin: 0 16px;">
    <img src="static/sponsors/brilliant-logo.png" width="90" alt="Brilliant">
  </a>
</p>
