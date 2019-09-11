FROM __BASE_CEPH_IMAGE__
# for openSUSE, use:
# FROM registry.opensuse.org/home/ssebastianwagner/rook-ceph/images/opensuse/leap:latest


#ADD bin.tar.gz /usr/bin/
#ADD lib.tar.gz /usr/lib64/

# Assume developer is using default paths (i.e. /usr/local), so
# build binaries will be looking for libs there.
#ADD eclib.tar.gz /usr/local/lib64/ceph/erasure-code/
#ADD clslib.tar.gz /usr/local/lib64/rados-classes/

#RUN zypper install -y python3-pip
#RUN pip3 install backports.functools_lru_cache
#RUN zypper install -y vim
#RUN pip install kubernetes --upgrade

ADD mgr_plugins.tar.gz /usr/share/ceph/mgr
