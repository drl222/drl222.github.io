#!/usr/bin/python
import MySQLdb as mdb
import sys

print "Content-type: text\html\n"
print "{\"characters\":["

try:
   con = mdb.connect('localhost', 'dlin', 'dlin2dlin', 'dlin');
   with con:
     cur=con.cursor(mdb.cursors.DictCursor)
     cur.execute("select name, baseClass from FireEmblem")
     rows=cur.fetchall()
     for row in rows: 
       print "{\"name\":" + row["name"] + "</td>"
       print "<td>" + row["baseClass"] + "</td>"
       print "<td><img src=\"images/"+row["name"]+".png\" class=\"thumb\"/></td>"
except mdb.Error, e:
   print "Error %d: %s" % (e.args[0],e.args[1])
   sys.exit(1)
finally:    
   if con:    
      con.close()

print "</table>"
print "<br/>"
print "</div>"
print "</HTML>"
