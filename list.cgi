#!/usr/bin/python
import MySQLdb as mdb
import sys

print "Content-type: text\html\n"
print "<!DOCTYPE html>\n<HTML>"

print "<head>"
print "<title>List of Characters in Fire Emblem</title>"
print "<link href=\"styles/fireEmblem.css\" rel=\"stylesheet\"/>"
print "</head>"
print "<body>"
print "<h1 align=\"center\"> Who are they? </h1>"
print "<div>"
print "<ul class=\"characters\">"
try:
   con = mdb.connect('localhost', 'dlin', 'dlin2dlin', 'dlin');
   with con:
     cur=con.cursor(mdb.cursors.DictCursor)
     cur.execute("select name, baseClass from FireEmblem")
     rows=cur.fetchall()
     for row in rows: 
       print "<li>"
       print "<img class=\"thrumb\" src=\"images/"+row["name"]+".png\"/>"
       print row["name"], row["baseClass"]  
       print "</li>"
     print "</ul>"
except mdb.Error, e:
   print "Error %d: %s" % (e.args[0],e.args[1])
   sys.exit(1)
finally:    
   if con:    
      con.close()
print "</body>"
print "</HTML>"
