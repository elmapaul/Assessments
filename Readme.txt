Notes: In my opinion this solution is not traditional and it addressed for small/middle input stream size. 
P.S. Optimization could not be done due to limited time.

What are some of the challenges with the problem as input grows?
-----------------------------------------------------------------------
As input grows we have two main problems:

1) File size is getting bigger and it is getting more time consuming(as storage issue) to re-read from start to end so that to find and remove duplicates. (For that reason I decided to use temporary object as "cache")
2) Theoritacally, with growing of interval array it may occur exponentional issue with calculations of interval blocks - what are merged or not.