<script>
	import { FULL_NAME } from '$lib/constants';
  import { formatTitle } from "$lib/utils/formatting";
</script>

<svelte:head>

<title>{formatTitle("Content Policy")}</title>
</svelte:head>

## Content Policy

Please note that this page does not contain legal advice. Rather, it is a set of guidelines to
follow to make sure that your submission to the {FULL_NAME} abides by proper copyright law.

In general, as long as you double-check to make sure you have permission to use all material
(music, video, imagery, text, etc.) contained in your submission to the Summer of Math
Exposition, you should be good to go. That said, copyright law is incredibly confusing, so this
page should (hopefully) help you navigate a bit.

<h3 id="fair-use">On Copyrighted material and Fair Use</h3>

**In general, you are not allowed to use copyrighted material in the Summer of Math Exposition
without permission; however, you can still use the content in such a way that it falls under [fair use](https://support.google.com/legal/answer/4558992).**

What does this mean? Well…

### Quick overview of Fair Use

Fair use is a bit of a gray area legally, but it is generally a way for creators to use
copyrighted material in their own work by transforming its original intent. For example, if you
make a video discussing the differences between two of your favorite animated shows, this could
be considered Fair Use because your video is not merely providing the same function as those
shows, entertainment, it’s serving a distinct function, namely an in-depth analysis. It’s even
more likely to be considered Fair Use if you only show short clips of the content and not the
content as a whole. In contrast, if you simply re-upload the animated shows on your youtube
channel, that would be copyright infringement.

### Quick examples

Totally OK:

- Let’s say you are making a video on Iterated Function Systems and you found some images of fractals you can generate with the method. It’s totally fine to use those images as long as you are using them as examples to better explain your own points.

Totally _not_ OK:

- Let’s say you are making a video and want some background music from Taylor Swift. Don’t do that.
- Let’s say you are making a blog post and find a great description of your topic in a textbook so you copy and paste that into your own work. That’s plagiarism. Don’t do that unless you properly cite the source and build off of it.

### Conclusion

If you want to use copyrighted material in your video or blog post, err on the side of caution
and don’t use it unless you either have the consent of the copyright holder, or your use fits
the criteria of Fair Use. Otherwise, you might have a content claim to deal with, which is a
huge pain.

For the Summer of Math Exposition, just know that we will not consider entries which violate
copyright law.

<h2 id="software">On using specific software</h2>

It is somewhat tricky to determine whether specific tools can be used for the Summer of Math Exposition and it largely depends on individual usage policies set by the individuals and companies developing the software, itself.
The core problem is related to the commercial usage of specific intellectual property (the software).
Simply put: if you use a piece of software to make a youtube video and then proceed to put advertisements on that video, you are using the software to make money, which constitutes commercial use.
In addition, the Summer of Math Exposition provides a cash prize to several of the top entries, which means even non-video entries constitute commercial use.

So let's break this down. Here is a list of software you can and cannot use for this competition:
**Definitely OK:**

- Any open source programming language (C, Python, Julia, etc).
- Virtually any other open source software with a traditional license: MIT, BSD, Apache, GNU, etc. Note that if you use the GNU license, you must also license any derivative software as open source as well, but it is still permissible to use such code commercially.

**Maybe OK:**

- Software with restrictive licenses (forbidding commercial use) that you have a formal agreement with or allows for commercial use. Note that we have explicit permission to use the following tools for this competition:
  - Geogebra
  - Desmos

**Definitely not OK:**

- Unlicensed software. This means the code is under copyright of the original author and cannot be used without some sort of copyright agreement.
- Software with restrictive licensing (forbidding commercial use) without an agreement. Please ask the developer or ask us to contact a company for you.

Note that it's possible to use copyrighted software under fair use if you use the code as a point of criticism or parody in some way. For example, if your video is analyzing different strategies to do math visualization, you can use code with restrictive licenses to compare it to other codebases.

Ultimately, just be careful and check the licenses of software before you use it.

<h2 id="cc">On Creative Commons and Public Domain material</h2>

**In general, you are permitted to use any material licensed under Creative Commons or Public
Domain; however, there are some restrictions to keep in mind.**

[Creative Commons](https://creativecommons.org/about/cclicenses/) (CC) licensing is a bit confusing, but is generally for material that is meant to be reused in other copyrighted work. That said, the creator of CC work is <em>still the copyright holder</em> and still has rights, they are simply sharing some of those rights with others to re-use or distribute their work as well.

Let’s talk about what this means

### CC0: Public Domain

Any content used under this license is fair game, no strings attached. That said, it would be
nice to credit the creator of the material somewhere.

### CC-BY: Creative Commons by an author

This is (probably) the most common CC license and the only one allowed to choose by default on
youtube (more information on that in the “How to license CC work on youtube” section below).
This license simply means you need to provide attribution to the original content creator when
using CC-BY work. A good guide on how to do this can be found [here](https://creativecommons.org/use-remix/)

### CC-NC: Creative Commons Non-Commercial

This license simply means that you cannot use the CC content in any content that generates
revenue. If you are using it for a classroom, that’s totally fine; however, you cannot put it in
a youtube video if you also have ads enabled because you could be making income from the ads.

For this reason, CC-NC can technically be used in the competition, but anything using CC-NC
content is ineligible for winning a cash prize at the end.

### CC-SA: Creative Commons Share Alike

This license means that any derivative work should be under the same license. So if you use
content under CC-SA, your future content <em>must also be under CC-SA!</em>

At first, this might seem like an unusual request, but it’s a simple way to protect the
copyright holder and also ensure there is more open content for other people to use in the
future. If people using CC-SA work were allowed to change the license, they could (in
principle), change the content into CC-BY content and then use the work under copyright,
ultimately profiting from someone else’s copyright!

### CC-ND: Creative Commons No Derivatives

This means that if you want to use the CC content in your own work, you must share it exactly as
it was created, no modifications allowed.

In general, treat CC-ND content as if it were under copyright. It can still be used under fair
use without modifying the copyright of your final submission.

### Putting it all together

CC licenses can also be mixed and matched, so if you see CC-BY-NC-SA, this means you need to
abide by all the licenses:

- BY: provide attribution
- NC: you must use the content in a non-commercial way
- SA: you must use the same license on your own content (CC-BY-NC-SA in this case)

### How to license CC work on youtube

For blog posts, it is clear how to license your content under CC: just put the CC license
somewhere (preferably on every page). For youtube, things are a bit different.

Youtube _does_ allow content creators to use the CC-BY license by default, but any other CC
licenses are not explicitly allowed. For the purposes of this competition, if you want to use other
CC licenses, use the CC-BY license for your video and then specify the license you would like to
use in the description.

Note (again) that this is not legal advice and we are unsure of whether such licensing would
hold up in court.
