#!/usr/bin/python
import MySQLdb as mdb
import sys

print "Content-type: text\html\n"
print "{\"characters\":["

try:
   con = mdb.connect('localhost', 'dlin', 'dlin2dlin', 'dlin');
   with con:
     cur=con.cursor(mdb.cursors.DictCursor)
     cur.execute("select id, name, baseClass, altClass1, altClass2, altClass3 from FireEmblem")
     rows=cur.fetchall()
     count = len(rows)
     for row in rows: 
       count -= 1
       print "{\"name\":\"" + row["name"] + "\","
       print "\"id\":\"" + str(row["id"]) + "\","
       print "\"class\":\"" + row["baseClass"] + "\","
       if row["altClass1"] is not None:
         print "\"altClass1\":\"" + row["altClass1"] + "\","
         if row["altClass2"] is not None:
           print "\"altClass2\":\"" + row["altClass2"] + "\","
           if row["altClass3"] is not None:
             print "\"altClass3\":\"" + row["altClass3"] + "\","
       print "\"thumb\":\"../images/"+row["name"]+".png\","
       print "\"image\":\"../images/fullBody/"+row["name"]+".jpg\"}"
       if count:
         print ","
       else:
         break
except mdb.Error, e:
   print "Error %d: %s" % (e.args[0],e.args[1])
   sys.exit(1)
finally:    
   if con:    
      con.close()

print "]}"
