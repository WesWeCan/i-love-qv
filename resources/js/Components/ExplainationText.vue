<script setup lang="ts">

import brain from '@/Assets/img/brain.png';
import collision from '@/Assets/img/collision.png';
import traffic from '@/Assets/img/vertical-traffic-light.png';
</script>

<template>
    <article>

        <div class="title">
            <img src="/img/heart_cyan.png" alt="Heart" class="heart-icon" />
            <h2>About Quadratic Voting</h2>
        </div>

        <div class="text-container">
            <p>
                QV is a clever method for figuring out which issues people care about most. For instance, if the group
                must decide on how to spend their time on different tasks, QV can gather and organise preferences about
                which ones the group wants to prioritise.
            </p>

            <p>
                Everyone has equal voting power, which you can use to boost the issues you care about most– but you must
                weigh your decisions carefully. If you go all out on one issue it will cost you more (this is the
                quadratic formula) and you will have less voting power for the remaining issues on the ballot.
            </p>

            <p>
                QV can mitigate situations in which a factional majority can suppress the will of the minority. In this
                way, it leads to more equitable and just decision making.
            </p>
        </div>
    </article>

    <article>
        <div class="title">
            <img src="/img/heart_gold.png" alt="Heart" class="heart-icon" />
            <h2>Using the tool</h2>
        </div>
        <div class="text-container">
            <p>Each ballot can contain up to ten issues, which can each be voted on. It is up to you weigh these issues
                and decide which ones you care about most. Instead of simply voting in favour of or opposed to an issue,
                you express the degree to which you are in favour of or opposed an issue.</p>
            <p>The heart is a reservoir for your voting power, and as you vote power will move between the heart and the
                issues you’re voting on. You can reset the heart if you’d like to start voting from scratch again. Once you’re finished press submit and your votes will be tallied with those of the group, and the
                collective result shared.</p>
        </div>

    </article>

    <article>
        <div class="title">
            <img src="/img/heart_purple.png" alt="Heart" class="heart-icon" />
            <h2>Reading the results</h2>
        </div>
        <div class="text-container">
            <p>A quadratic vote produces a gold mine of information! Not only does it produce a ranking of all issues
                based on most netto votes– it can also point to remarkable outcomes. For instance, issues that received
                a lot of traffic<Popper hover placement="top" content="High Traffic"><span class="icon"><img :src="traffic"
                    alt="Traffic" class="traffic-icon" /></span></Popper>may be polarising <Popper hover placement="top" content="Polarising"><span class="icon"><img
                        :src="collision" alt="Collision" class="collision-icon" /></span></Popper> or issues nobody in the group is against (a so-called no-brainer.) <Popper hover placement="top" content="No Brainer"><span class="icon"><img :src="brain" alt="Brain"
                            class="brain-icon" /></span></Popper> These outcomes are indicated by badges, which can be helpful for guiding further deliberation and
                discussion. It is up to the group if a QV vote is binding or a stepping stone in your decision making
                process.</p>
        </div>

    </article>
</template>