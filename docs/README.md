# Space Pods :vulcan_salute:

[![Build Status](https://jenkins.tino.sh/buildStatus/icon?job=spacePods%2Fmaster)](https://jenkins.tino.sh/job/spacePods/job/master/)
![last-commit](https://img.shields.io/github/last-commit/tinoschroeter/spacePods.svg?style=flat)

> Navigate a Spaceship through Kubernetes and shoot Pods :rocket:

This project is meant to learn about **chaos engineering**, **readinessProbe**, **livenessProbe** and **resilience in kubernetes** in general.

![im2](https://raw.githubusercontent.com/tinoschroeter/spacePods/master/docs/spacePods2.png)

The application consists of a **nodejs backend** and a frontend written in **JavaScript**.

==frontent is an adapted version of [spaceship-parallax](https://github.com/ScriptRaccoon/spaceship-parallax)== :heart:

The backend has two entry points, one to display all pods in a namespace and one to delete pods via the
the Kubernetes API.

When a lot of pods are fired, you can see it very well in the increasing error rate :boom:.

---

:wrench: In the next step, by increasing the replicas and modifying readinessProbe and livenessProbe, you can decrease the
error rates :100:.


**May the Force be with you.** :space_invader:
