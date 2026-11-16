> English translation of [`docs/rookie-melhorias-playtest.md`](../../docs/rookie-melhorias-playtest.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# Rookie Rocket — improvements after the playtest

## Goal and way of working

Investigate and fix the interface, navigation, tutorial, progression, science content and performance problems noted in the playtest. The notes are brief: reproduce the problems before changing anything, and do not present hypotheses as confirmed facts.

Read `CLAUDE.md`, `AGENTS.md`, `TASKS.md` and the relevant contracts; respect file reservations, worktrees and the phase-based generator. Check the current state of Studio and of the repository. The last rebuild reported a failure in phase 16 caused by a pedestal blocking circulation in the planetarium; check whether it still happens. Texts visible in the game must be in English.

## 1. Images and design

The playtest reports images "glitching a little". Identify which screens and images show the problem and check asset IDs, loading, permissions and moderation. Fix the observed defect, such as a missing image, distortion, cropping, flickering or overlap. Use a loading state or a readable fallback if needed. Test different resolutions, including mobile.

The words "feedback" and "background" appear in the note with no explanation. Examine the contrast, legibility, hierarchy and visual response of the interfaces and record the problems found. Do not assume a specific redesign.

## 2. Arrows and objective sequence

The floor arrows were reported as faulty and pointing the wrong way. Reproduce on corners, doors, stairs and near walls; fix orientation, rotation, destination updates and waypoints according to the observed cause. The arrow must guide along the accessible path, without pointing through walls.

During missions, point to the station of the **current** task, in the right order; update the destination on progress and clear stale indicators on failure, restart, exit or mission change. Navigation must be individual for each player.

In the museum, keep the requested rule: you must interact with at least one item to continue. On entering the right room, replace the red arrow with a **white circle that highlights the item**. After the interaction, show the next destination. Test visibility and placement at different distances and on different devices.

## 3. A more intuitive tutorial

Show one short objective at a time and give feedback when it is completed. The desired sequence is: find Marcos Pontes; follow him to the museum; select an exhibit; go on to the rocket and find Ana; choose mission, suit and equipment; board and complete the tasks in order.

Explain controls at the moment they are needed. Ensure legibility on keyboard, touch and gamepad; do not rely on color alone. Avoid conflicting prompts and dialogues that stop the player from acting. On respawn, return or restart, restore an objective consistent with the progress.

## 4. Mission selection and feedback

The image says "leave the mission selection screen" but does not specify the desired change. Do not invent a visual requirement: review the screen and fix the concrete problems found.

Make the selected mission, availability, suit, equipment, weight and the 60 kg limit clear, according to the current system. Say why an action is blocked and how to move forward. Validate suit, permissions and weight on the server; test opening, closing, returning and restarting.

## 5. Science and the real mission card

Add scientific and historical context tied to each mission and task. Include or fix the **card about the real mission**, preferably after the result; if it already exists, review how it works before creating another.

Each card must present a verified title, mission and date, a brief explanation of the real event, the relation to the challenge played and an official, directly related source. Explain trade-offs between mass, resources and benefits. Identify simplified times, weights and effects as game values, without presenting them as historical data.

Research and check data in primary sources, including NASA and the responsible agencies. Check source, authorization and terms of use for every image. Marcos Pontes's lines are fictional and must not look like quotes or a real endorsement.

## 6. Remove the Mission Board

The note asks to "remove the Mission Board". First identify the exact object and its dependencies. Remove the indicated element and its orphan prompts or references, keeping the selection with Ana and the historical card. Confirm that progression does not depend on the panel before removing it.

## 7. Fix the confusion in progression

Reproduce the whole route and identify where the objective shown diverges from the action required. Review reception, museum, rocket, selection, boarding, tasks, result and return. Each transition must have a clear condition, visible feedback and a suitable indicator.

Test the locks and unlocks planned in the project, failure, restart, exit, respawn, reconnection and individual progress in co-op. Do not change unlock rules without checking the current specs; document any change that is needed.

## 8. Optimization

Measure before and after under comparable conditions and prioritize the bottlenecks observed: duplicated connections or loops, repeated lookups, unnecessary interface updates, too many objects and heavy assets. Record method, environment and limitations; Studio FPS in the background is not a reliable measure. Preserve quality and behavior.

## 9. Acceptance criteria and delivery

- The images and the selection work at the screen sizes tested; problems that could not be reproduced are reported.
- The arrows show the next valid action; in the museum, the white circle appears and interacting with an item unlocks the next stage.
- The tutorial and the progression correctly follow the player's state on failure, restart and return.
- There is contextualized science and a real mission card with verifiable sources.
- The identified Mission Board was removed without breaking the systems that remain.
- Report performance results and limitations, the checks run, the phases to rebuild and a playtest script; separate what passed, what failed and what could not be tested.
- Update the records and the PR according to the project instructions.
